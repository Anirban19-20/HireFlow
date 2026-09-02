package com.anirban.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    private static final String BUCKET = "resumes";

    private static final long MAX_FILE_SIZE =
            5 * 1024 * 1024;

    private final RestTemplate restTemplate =
            new RestTemplate();

    // =====================================================
    // UPLOAD RESUME
    // =====================================================

    public String uploadResume(
            Long candidateId,
            MultipartFile file)
            throws IOException {

        // =================================================
        // VALIDATE FILE
        // =================================================

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Resume file is required"
            );
        }

        if (!MediaType.APPLICATION_PDF_VALUE
                .equalsIgnoreCase(
                        file.getContentType()
                )) {

            throw new RuntimeException(
                    "Only PDF resume files are allowed"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new RuntimeException(
                    "Resume file must be smaller than 5 MB"
            );
        }

        // =================================================
        // CREATE UNIQUE FILE NAME
        // =================================================

        String fileName =
                "candidate-"
                + candidateId
                + "-"
                + UUID.randomUUID()
                + ".pdf";

        // =================================================
        // UPLOAD URL
        // =================================================

        String uploadUrl =
                supabaseUrl
                + "/storage/v1/object/"
                + BUCKET
                + "/"
                + fileName;

        // =================================================
        // HEADERS
        // =================================================

        HttpHeaders headers =
                new HttpHeaders();

        headers.setBearerAuth(
                serviceRoleKey
        );

        headers.set(
                "apikey",
                serviceRoleKey
        );

        headers.setContentType(
                MediaType.APPLICATION_PDF
        );

        headers.set(
                "x-upsert",
                "true"
        );

        HttpEntity<byte[]> request =
                new HttpEntity<>(
                        file.getBytes(),
                        headers
                );

        // =================================================
        // UPLOAD
        // =================================================

        try {

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            uploadUrl,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            if (!response
                    .getStatusCode()
                    .is2xxSuccessful()) {

                throw new RuntimeException(
                        "Failed to upload resume"
                );
            }

        } catch (HttpClientErrorException e) {

            System.out.println(
                    "Supabase upload error: "
                    + e.getResponseBodyAsString()
            );

            throw new RuntimeException(
                    "Failed to upload resume: "
                    + e.getResponseBodyAsString()
            );
        }

        // =================================================
        // RETURN PUBLIC URL
        // =================================================

        return supabaseUrl
                + "/storage/v1/object/public/"
                + BUCKET
                + "/"
                + fileName;
    }

    // =====================================================
    // DELETE RESUME
    // =====================================================

    public void deleteResume(
            String resumeUrl) {

        // =================================================
        // VALIDATE URL
        // =================================================

        if (resumeUrl == null ||
                resumeUrl.isBlank()) {

            return;
        }

        // Public URL prefix generated by uploadResume()
        String publicPrefix =
                supabaseUrl
                + "/storage/v1/object/public/"
                + BUCKET
                + "/";

        // =================================================
        // MAKE SURE URL BELONGS TO OUR BUCKET
        // =================================================

        if (!resumeUrl.startsWith(
                publicPrefix
        )) {

            throw new RuntimeException(
                    "Invalid resume URL"
            );
        }

        // =================================================
        // EXTRACT OBJECT NAME
        // =================================================

        String objectPath =
                resumeUrl.substring(
                        publicPrefix.length()
                );

        if (objectPath.isBlank()) {

            throw new RuntimeException(
                    "Invalid resume file path"
            );
        }

        System.out.println(
                "Deleting resume object: "
                + objectPath
        );

        // =================================================
        // DELETE URL
        // =================================================

        String deleteUrl =
                supabaseUrl
                + "/storage/v1/object/"
                + BUCKET
                + "/"
                + objectPath;

        // =================================================
        // HEADERS
        // =================================================

        HttpHeaders headers =
                new HttpHeaders();

        headers.setBearerAuth(
                serviceRoleKey
        );

        headers.set(
                "apikey",
                serviceRoleKey
        );

        HttpEntity<Void> request =
                new HttpEntity<>(
                        headers
                );

        // =================================================
        // DELETE FROM SUPABASE
        // =================================================

        try {

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            deleteUrl,
                            HttpMethod.DELETE,
                            request,
                            String.class
                    );

            if (!response
                    .getStatusCode()
                    .is2xxSuccessful()) {

                throw new RuntimeException(
                        "Failed to delete resume"
                );
            }

            System.out.println(
                    "Resume deleted successfully"
            );

        } catch (HttpClientErrorException e) {

            System.out.println(
                    "Supabase delete error: "
                    + e.getResponseBodyAsString()
            );

            throw new RuntimeException(
                    "Failed to delete resume: "
                    + e.getResponseBodyAsString()
            );
        }
    }
}