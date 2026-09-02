package com.anirban.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.text.NumberFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import org.apache.pdfbox.pdmodel.common.PDRectangle;

import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anirban.entity.Application;
import com.anirban.entity.Job;
import com.anirban.entity.JobOffer;
import com.anirban.entity.OfferStatus;
import com.anirban.entity.RecruiterProfile;
import com.anirban.entity.User;

import com.anirban.repository.JobOfferRepository;
import com.anirban.repository.RecruiterProfileRepository;


@Service
public class OfferLetterPdfService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    OfferLetterPdfService.class
            );


    private final JobOfferRepository
            jobOfferRepository;

    private final RecruiterProfileRepository
            recruiterProfileRepository;


    // =====================================================
    // DATE FORMAT
    // =====================================================

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern(
                    "dd MMMM yyyy"
            );


    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern(
                    "dd MMMM yyyy, hh:mm a"
            );


    // =====================================================
    // PDF FONTS
    // =====================================================

    private static final PDFont FONT_REGULAR =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA
            );


    private static final PDFont FONT_BOLD =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA_BOLD
            );


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public OfferLetterPdfService(
            JobOfferRepository jobOfferRepository,
            RecruiterProfileRepository recruiterProfileRepository) {

        this.jobOfferRepository =
                jobOfferRepository;

        this.recruiterProfileRepository =
                recruiterProfileRepository;
    }


    // =====================================================
    // RECRUITER - GENERATE / PREVIEW OFFER LETTER
    // =====================================================

    @Transactional(readOnly = true)
    public byte[] generateForRecruiter(
            Long recruiterId,
            Long offerId) {

        if (recruiterId == null) {

            throw new RuntimeException(
                    "Recruiter ID is required"
            );
        }


        JobOffer offer =
                getOffer(
                        offerId
                );


        validateRecruiterOwnership(
                offer,
                recruiterId
        );


        LOGGER.info(
                "Generating recruiter offer letter. recruiterId={}, offerId={}, status={}",
                recruiterId,
                offerId,
                offer.getStatus()
        );


        return generatePdf(
                offer
        );
    }


    // =====================================================
    // CANDIDATE - DOWNLOAD OFFER LETTER
    // =====================================================

    @Transactional(readOnly = true)
    public byte[] generateForCandidate(
            Long candidateId,
            Long offerId) {

        if (candidateId == null) {

            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }


        JobOffer offer =
                getOffer(
                        offerId
                );


        validateCandidateOwnership(
                offer,
                candidateId
        );


        // =================================================
        // DRAFT OFFER MUST NOT BE VISIBLE TO CANDIDATE
        // =================================================

        if (offer.getStatus() ==
                OfferStatus.DRAFT) {

            throw new RuntimeException(
                    "Draft offer letter is not available to candidate"
            );
        }


        LOGGER.info(
                "Generating candidate offer letter. candidateId={}, offerId={}, status={}",
                candidateId,
                offerId,
                offer.getStatus()
        );


        return generatePdf(
                offer
        );
    }


    // =====================================================
    // GET OFFER
    // =====================================================

    private JobOffer getOffer(
            Long offerId) {

        if (offerId == null) {

            throw new RuntimeException(
                    "Offer ID is required"
            );
        }


        if (offerId <= 0) {

            throw new RuntimeException(
                    "Invalid offer ID"
            );
        }


        return jobOfferRepository
                .findById(
                        offerId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Job offer not found for ID: "
                                                + offerId
                                )
                );
    }


    // =====================================================
    // RECRUITER OWNERSHIP
    // =====================================================

    private void validateRecruiterOwnership(
            JobOffer offer,
            Long recruiterId) {

        if (offer == null) {

            throw new RuntimeException(
                    "Job offer is required"
            );
        }


        if (recruiterId == null) {

            throw new RuntimeException(
                    "Recruiter ID is required"
            );
        }


        Application application =
                offer.getApplication();


        if (application == null) {

            throw new RuntimeException(
                    "Offer application information is missing"
            );
        }


        Job job =
                application.getJob();


        if (job == null) {

            throw new RuntimeException(
                    "Offer job information is missing"
            );
        }


        User recruiter =
                job.getRecruiter();


        if (recruiter == null ||
                recruiter.getId() == null) {

            throw new RuntimeException(
                    "Offer recruiter information is missing"
            );
        }


        if (!recruiter
                .getId()
                .equals(
                        recruiterId
                )) {

            throw new RuntimeException(
                    "You are not authorized to access this offer letter"
            );
        }
    }


    // =====================================================
    // CANDIDATE OWNERSHIP
    // =====================================================

    private void validateCandidateOwnership(
            JobOffer offer,
            Long candidateId) {

        if (offer == null) {

            throw new RuntimeException(
                    "Job offer is required"
            );
        }


        if (candidateId == null) {

            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }


        Application application =
                offer.getApplication();


        if (application == null) {

            throw new RuntimeException(
                    "Offer application information is missing"
            );
        }


        User candidate =
                application.getCandidate();


        if (candidate == null ||
                candidate.getId() == null) {

            throw new RuntimeException(
                    "Offer candidate information is missing"
            );
        }


        if (!candidate
                .getId()
                .equals(
                        candidateId
                )) {

            throw new RuntimeException(
                    "You are not authorized to access this offer letter"
            );
        }
    }


    // =====================================================
    // GENERATE PDF
    // =====================================================

    private byte[] generatePdf(
            JobOffer offer) {

        if (offer == null) {

            throw new RuntimeException(
                    "Job offer is required for PDF generation"
            );
        }


        // =================================================
        // APPLICATION
        // =================================================

        Application application =
                offer.getApplication();


        if (application == null) {

            throw new RuntimeException(
                    "Offer application information is missing"
            );
        }


        // =================================================
        // JOB
        // =================================================

        Job job =
                application.getJob();


        if (job == null) {

            throw new RuntimeException(
                    "Offer job information is missing"
            );
        }


        // =================================================
        // CANDIDATE
        // =================================================

        User candidate =
                application.getCandidate();


        if (candidate == null) {

            throw new RuntimeException(
                    "Offer candidate information is missing"
            );
        }


        // =================================================
        // RECRUITER
        // =================================================

        User recruiter =
                job.getRecruiter();


        RecruiterProfile recruiterProfile =
                null;


        if (recruiter != null &&
                recruiter.getId() != null) {

            recruiterProfile =
                    recruiterProfileRepository
                            .findByUserId(
                                    recruiter.getId()
                            )
                            .orElse(
                                    null
                            );
        }


        // =================================================
        // COMPANY NAME
        // =================================================

        String companyName =
                getCompanyName(
                        recruiterProfile,
                        recruiter
                );


        LOGGER.info(
                "Creating PDF for offerId={}, candidate={}, company={}, job={}",
                offer.getId(),
                getCandidateName(candidate),
                companyName,
                getJobTitle(job)
        );


        try (
                PDDocument document =
                        new PDDocument();

                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {

            PdfWriter writer =
                    new PdfWriter(
                            document
                    );


            // =================================================
            // HEADER
            // =================================================

            writer.drawHeader(
                    companyName,
                    offer.getStatus()
            );


            // =================================================
            // OFFER DATE
            // =================================================

            writer.writeRightAligned(
                    getOfferDate(
                            offer
                    ),
                    FONT_REGULAR,
                    10
            );


            writer.addSpace(
                    18
            );


            // =================================================
            // RECIPIENT
            // =================================================

            writer.writeLine(
                    "To,",
                    FONT_REGULAR,
                    11
            );


            writer.writeLine(
                    getCandidateName(
                            candidate
                    ),
                    FONT_BOLD,
                    12
            );


            if (candidate.getEmail() != null &&
                    !candidate
                            .getEmail()
                            .isBlank()) {

                writer.writeLine(
                        candidate
                                .getEmail()
                                .trim(),
                        FONT_REGULAR,
                        10
                );
            }


            writer.addSpace(
                    15
            );


            // =================================================
            // SUBJECT
            // =================================================

            writer.writeParagraph(
                    "Subject: Offer of Employment - "
                            + getJobTitle(
                                    job
                            ),
                    FONT_BOLD,
                    12,
                    16
            );


            writer.addSpace(
                    8
            );


            // =================================================
            // GREETING
            // =================================================

            writer.writeParagraph(
                    "Dear "
                            + getCandidateFirstName(
                                    candidate
                            )
                            + ",",
                    FONT_REGULAR,
                    11,
                    16
            );


            writer.addSpace(
                    5
            );


            // =================================================
            // INTRODUCTION
            // =================================================

            writer.writeParagraph(
                    "We are pleased to offer you the position of "
                            + getJobTitle(job)
                            + " at "
                            + companyName
                            + ". We are excited about the possibility "
                            + "of you joining our team and contributing "
                            + "to our organization.",
                    FONT_REGULAR,
                    11,
                    17
            );


            writer.addSpace(
                    14
            );


            // =================================================
            // OFFER DETAILS
            // =================================================

            writer.writeSectionTitle(
                    "Offer Details"
            );


            writer.writeDetail(
                    "Position",
                    getJobTitle(
                            job
                    )
            );


            writer.writeDetail(
                    "Annual Compensation",
                    formatSalary(
                            offer
                    )
            );


            writer.writeDetail(
                    "Joining Date",
                    formatDate(
                            offer.getJoiningDate()
                    )
            );


            writer.writeDetail(
                    "Offer Status",
                    formatStatus(
                            offer.getStatus()
                    )
            );


            if (offer.getExpiresAt() != null) {

                writer.writeDetail(
                        "Offer Valid Until",
                        formatDateTime(
                                offer.getExpiresAt()
                        )
                );
            }


            writer.addSpace(
                    12
            );


            // =================================================
            // CUSTOM MESSAGE
            // =================================================

            if (offer.getMessage() != null &&
                    !offer
                            .getMessage()
                            .isBlank()) {

                writer.writeSectionTitle(
                        "Additional Information"
                );


                writer.writeParagraph(
                        offer
                                .getMessage()
                                .trim(),
                        FONT_REGULAR,
                        10.5f,
                        16
                );


                writer.addSpace(
                        12
                );
            }


            // =================================================
            // ACCEPTANCE
            // =================================================

            writer.writeSectionTitle(
                    "Acceptance"
            );


            writer.writeParagraph(
                    "Please review the terms of this offer carefully. "
                            + "Your response to this offer is recorded "
                            + "through the HireFlow recruitment platform. "
                            + "The joining date and other employment "
                            + "formalities may be coordinated separately "
                            + "by the recruiter.",
                    FONT_REGULAR,
                    10.5f,
                    16
            );


            writer.addSpace(
                    18
            );


            // =================================================
            // CLOSING
            // =================================================

            writer.writeParagraph(
                    "We look forward to welcoming you to "
                            + companyName
                            + ".",
                    FONT_REGULAR,
                    11,
                    16
            );


            writer.addSpace(
                    20
            );


            writer.writeLine(
                    "Sincerely,",
                    FONT_REGULAR,
                    10.5f
            );


            if (recruiter != null &&
                    recruiter.getName() != null &&
                    !recruiter
                            .getName()
                            .isBlank()) {

                writer.writeLine(
                        recruiter
                                .getName()
                                .trim(),
                        FONT_BOLD,
                        11
                );
            }


            writer.writeLine(
                    companyName,
                    FONT_BOLD,
                    11
            );


            if (recruiterProfile != null &&
                    recruiterProfile.getWebsite() != null &&
                    !recruiterProfile
                            .getWebsite()
                            .isBlank()) {

                writer.writeLine(
                        recruiterProfile
                                .getWebsite()
                                .trim(),
                        FONT_REGULAR,
                        9.5f
                );
            }


            writer.addSpace(
                    28
            );


            // =================================================
            // DISCLAIMER
            // =================================================

            writer.drawSeparator();


            writer.addSpace(
                    8
            );


            writer.writeParagraph(
                    "This document was generated electronically by "
                            + "HireFlow from the offer details recorded "
                            + "in the recruitment system.",
                    FONT_REGULAR,
                    8.5f,
                    12
            );


            // =================================================
            // FINISH CONTENT STREAM
            // =================================================

            writer.finish();


            // =================================================
            // SAVE PDF
            // =================================================

            document.save(
                    outputStream
            );


            byte[] pdf =
                    outputStream
                            .toByteArray();


            // =================================================
            // VALIDATE PDF
            // =================================================

            validatePdfBytes(
                    pdf,
                    offer.getId()
            );


            LOGGER.info(
                    "Offer letter PDF generated successfully. offerId={}, bytes={}",
                    offer.getId(),
                    pdf.length
            );


            return pdf;

        } catch (IOException exception) {

            LOGGER.error(
                    "PDFBox IOException while generating offer letter. offerId={}, reason={}",
                    offer.getId(),
                    exception.getMessage(),
                    exception
            );


            throw new RuntimeException(
                    "Unable to generate offer letter PDF: "
                            + safeExceptionMessage(
                                    exception
                            ),
                    exception
            );

        } catch (RuntimeException exception) {

            LOGGER.error(
                    "Runtime error while generating offer letter. offerId={}, reason={}",
                    offer.getId(),
                    exception.getMessage(),
                    exception
            );


            throw exception;

        } catch (Exception exception) {

            LOGGER.error(
                    "Unexpected error while generating offer letter. offerId={}, reason={}",
                    offer.getId(),
                    exception.getMessage(),
                    exception
            );


            throw new RuntimeException(
                    "Unable to generate offer letter PDF: "
                            + safeExceptionMessage(
                                    exception
                            ),
                    exception
            );
        }
    }


    // =====================================================
    // VALIDATE PDF BYTES
    // =====================================================

    private void validatePdfBytes(
            byte[] pdf,
            Long offerId) {

        if (pdf == null) {

            throw new RuntimeException(
                    "PDF generation returned null for offer "
                            + offerId
            );
        }


        if (pdf.length == 0) {

            throw new RuntimeException(
                    "PDF generation returned an empty file for offer "
                            + offerId
            );
        }


        if (pdf.length < 4) {

            throw new RuntimeException(
                    "Generated PDF is invalid for offer "
                            + offerId
            );
        }


        boolean validSignature =
                pdf[0] == '%' &&
                pdf[1] == 'P' &&
                pdf[2] == 'D' &&
                pdf[3] == 'F';


        if (!validSignature) {

            throw new RuntimeException(
                    "Generated file is not a valid PDF for offer "
                            + offerId
            );
        }
    }


    // =====================================================
    // COMPANY NAME
    // =====================================================

    private String getCompanyName(
            RecruiterProfile profile,
            User recruiter) {

        if (profile != null &&
                profile.getCompanyName() != null &&
                !profile
                        .getCompanyName()
                        .isBlank()) {

            return safePdfText(
                    profile
                            .getCompanyName()
                            .trim()
            );
        }


        if (recruiter != null &&
                recruiter.getName() != null &&
                !recruiter
                        .getName()
                        .isBlank()) {

            return safePdfText(
                    recruiter
                            .getName()
                            .trim()
            );
        }


        return "Hiring Company";
    }


    // =====================================================
    // CANDIDATE NAME
    // =====================================================

    private String getCandidateName(
            User candidate) {

        if (candidate == null) {

            return "Candidate";
        }


        if (candidate.getName() == null ||
                candidate
                        .getName()
                        .isBlank()) {

            return "Candidate";
        }


        return safePdfText(
                candidate
                        .getName()
                        .trim()
        );
    }


    // =====================================================
    // CANDIDATE FIRST NAME
    // =====================================================

    private String getCandidateFirstName(
            User candidate) {

        String name =
                getCandidateName(
                        candidate
                );


        int spaceIndex =
                name.indexOf(
                        " "
                );


        if (spaceIndex > 0) {

            return name.substring(
                    0,
                    spaceIndex
            );
        }


        return name;
    }


    // =====================================================
    // JOB TITLE
    // =====================================================

    private String getJobTitle(
            Job job) {

        if (job == null ||
                job.getTitle() == null ||
                job
                        .getTitle()
                        .isBlank()) {

            return "the offered position";
        }


        return safePdfText(
                job
                        .getTitle()
                        .trim()
        );
    }


    // =====================================================
    // OFFER DATE
    // =====================================================

    private String getOfferDate(
            JobOffer offer) {

        if (offer == null) {

            return LocalDate
                    .now()
                    .format(
                            DATE_FORMAT
                    );
        }


        LocalDateTime value =
                offer.getSentAt();


        if (value == null) {

            value =
                    offer.getCreatedAt();
        }


        if (value == null) {

            return LocalDate
                    .now()
                    .format(
                            DATE_FORMAT
                    );
        }


        return value
                .toLocalDate()
                .format(
                        DATE_FORMAT
                );
    }


    // =====================================================
    // SALARY
    // =====================================================

    private String formatSalary(
            JobOffer offer) {

        if (offer == null) {

            return "Not specified";
        }


        BigDecimal salary =
                offer.getOfferedSalary();


        if (salary == null) {

            return "Not specified";
        }


        NumberFormat formatter =
                NumberFormat.getNumberInstance(
                        Locale.forLanguageTag(
                                "en-IN"
                        )
                );


        formatter.setGroupingUsed(
                true
        );


        formatter.setMaximumFractionDigits(
                2
        );


        formatter.setMinimumFractionDigits(
                0
        );


        String currency =
                offer.getCurrency();


        if (currency == null ||
                currency.isBlank()) {

            currency =
                    "INR";
        }


        String formattedSalary =
                formatter.format(
                        salary.setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                );


        return safePdfText(
                currency
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        )
                        + " "
                        + formattedSalary
                        + " per annum"
        );
    }


    // =====================================================
    // DATE
    // =====================================================

    private String formatDate(
            LocalDate date) {

        if (date == null) {

            return "Not specified";
        }


        return date.format(
                DATE_FORMAT
        );
    }


    // =====================================================
    // DATE TIME
    // =====================================================

    private String formatDateTime(
            LocalDateTime dateTime) {

        if (dateTime == null) {

            return "Not specified";
        }


        return dateTime.format(
                DATE_TIME_FORMAT
        );
    }


    // =====================================================
    // STATUS
    // =====================================================

    private String formatStatus(
            OfferStatus status) {

        if (status == null) {

            return "Unknown";
        }


        String raw =
                status
                        .name()
                        .replace(
                                "_",
                                " "
                        )
                        .toLowerCase(
                                Locale.ROOT
                        );


        StringBuilder formatted =
                new StringBuilder();


        for (String word :
                raw.split(
                        "\\s+"
                )) {

            if (word == null ||
                    word.isBlank()) {

                continue;
            }


            if (formatted.length() > 0) {

                formatted.append(
                        " "
                );
            }


            formatted.append(
                    Character.toUpperCase(
                            word.charAt(
                                    0
                            )
                    )
            );


            if (word.length() > 1) {

                formatted.append(
                        word.substring(
                                1
                        )
                );
            }
        }


        return formatted.toString();
    }


    // =====================================================
    // PDF SAFE TEXT
    // =====================================================

    private static String safePdfText(
            String value) {

        if (value == null) {

            return "";
        }


        return value
                .replace(
                        '\u2018',
                        '\''
                )
                .replace(
                        '\u2019',
                        '\''
                )
                .replace(
                        '\u201C',
                        '"'
                )
                .replace(
                        '\u201D',
                        '"'
                )
                .replace(
                        '\u2013',
                        '-'
                )
                .replace(
                        '\u2014',
                        '-'
                )
                .replace(
                        '\u2026',
                        '.'
                )
                .replace(
                        '\u00A0',
                        ' '
                )
                .replaceAll(
                        "[^\\x20-\\x7E\\n\\r\\t]",
                        "?"
                );
    }


    // =====================================================
    // SAFE EXCEPTION MESSAGE
    // =====================================================

    private String safeExceptionMessage(
            Exception exception) {

        if (exception == null) {

            return "Unknown PDF generation error";
        }


        if (exception.getMessage() != null &&
                !exception
                        .getMessage()
                        .isBlank()) {

            return exception
                    .getMessage()
                    .trim();
        }


        return exception
                .getClass()
                .getSimpleName();
    }


    // =====================================================
    // PDF WRITER
    // =====================================================

    private static class PdfWriter {

        private static final float PAGE_MARGIN =
                55f;


        private static final float BOTTOM_MARGIN =
                55f;


        private static final float CONTENT_WIDTH =
                PDRectangle.A4
                        .getWidth()
                        - (
                        PAGE_MARGIN * 2
                );


        private final PDDocument
                document;


        private PDPage
                page;


        private PDPageContentStream
                stream;


        private float y;


        private int pageNumber =
                0;


        // =================================================
        // CONSTRUCTOR
        // =================================================

        PdfWriter(
                PDDocument document)
                throws IOException {

            if (document == null) {

                throw new IOException(
                        "PDF document is not available"
                );
            }


            this.document =
                    document;


            createPage();
        }


        // =================================================
        // CREATE PAGE
        // =================================================

        private void createPage()
                throws IOException {

            closeCurrentStream();


            page =
                    new PDPage(
                            PDRectangle.A4
                    );


            document.addPage(
                    page
            );


            stream =
                    new PDPageContentStream(
                            document,
                            page
                    );


            pageNumber++;


            y =
                    page.getMediaBox()
                            .getHeight()
                            - PAGE_MARGIN;


            if (pageNumber > 1) {

                writeLine(
                        "HireFlow - Offer Letter",
                        FONT_BOLD,
                        9
                );


                drawSeparator();


                addSpace(
                        10
                );
            }
        }


        // =================================================
        // CLOSE CURRENT STREAM
        // =================================================

        private void closeCurrentStream()
                throws IOException {

            if (stream != null) {

                stream.close();

                stream =
                        null;
            }
        }


        // =================================================
        // ENSURE SPACE
        // =================================================

        private void ensureSpace(
                float required)
                throws IOException {

            if (page == null) {

                createPage();

                return;
            }


            if (y - required <
                    BOTTOM_MARGIN) {

                createPage();
            }
        }


        // =================================================
        // HEADER
        // =================================================

        void drawHeader(
                String companyName,
                OfferStatus status)
                throws IOException {

            String safeCompanyName =
                    safePdfText(
                            companyName
                    );


            if (safeCompanyName.isBlank()) {

                safeCompanyName =
                        "Hiring Company";
            }


            float pageWidth =
                    page
                            .getMediaBox()
                            .getWidth();


            float pageHeight =
                    page
                            .getMediaBox()
                            .getHeight();


            // =============================================
            // BLUE HEADER
            // PDFBOX 3 FIX:
            // Use java.awt.Color instead of 0-255 float args.
            // =============================================

            stream.setNonStrokingColor(
                    new Color(
                            37,
                            99,
                            235
                    )
            );


            stream.addRect(
                    0,
                    pageHeight - 105,
                    pageWidth,
                    105
            );


            stream.fill();


            // =============================================
            // WHITE TEXT
            // =============================================

            stream.setNonStrokingColor(
                    Color.WHITE
            );


            writeTextAt(
                    safeCompanyName,
                    FONT_BOLD,
                    18,
                    PAGE_MARGIN,
                    pageHeight - 52
            );


            writeTextAt(
                    status ==
                            OfferStatus.DRAFT

                            ? "DRAFT OFFER LETTER"

                            : "OFFER LETTER",

                    FONT_BOLD,
                    11,
                    PAGE_MARGIN,
                    pageHeight - 75
            );


            // =============================================
            // RESET TO BLACK
            // =============================================

            stream.setNonStrokingColor(
                    Color.BLACK
            );


            y =
                    pageHeight - 132;
        }


        // =================================================
        // RIGHT ALIGNED
        // =================================================

        void writeRightAligned(
                String text,
                PDFont font,
                float size)
                throws IOException {

            ensureSpace(
                    size + 4
            );


            String safe =
                    clean(
                            text
                    );


            float width =
                    font.getStringWidth(
                            safe
                    ) /
                    1000f *
                    size;


            float x =
                    page
                            .getMediaBox()
                            .getWidth()
                            - PAGE_MARGIN
                            - width;


            if (x < PAGE_MARGIN) {

                x =
                        PAGE_MARGIN;
            }


            writeTextAt(
                    safe,
                    font,
                    size,
                    x,
                    y
            );


            y -=
                    size + 3;
        }


        // =================================================
        // LINE
        // =================================================

        void writeLine(
                String text,
                PDFont font,
                float size)
                throws IOException {

            ensureSpace(
                    size + 6
            );


            writeTextAt(
                    clean(
                            text
                    ),
                    font,
                    size,
                    PAGE_MARGIN,
                    y
            );


            y -=
                    size + 5;
        }


        // =================================================
        // PARAGRAPH
        // =================================================

        void writeParagraph(
                String text,
                PDFont font,
                float size,
                float leading)
                throws IOException {

            List<String> lines =
                    wrapText(
                            clean(
                                    text
                            ),
                            font,
                            size,
                            CONTENT_WIDTH
                    );


            for (String line :
                    lines) {

                ensureSpace(
                        leading
                );


                writeTextAt(
                        line,
                        font,
                        size,
                        PAGE_MARGIN,
                        y
                );


                y -=
                        leading;
            }
        }


        // =================================================
        // SECTION TITLE
        // =================================================

        void writeSectionTitle(
                String title)
                throws IOException {

            ensureSpace(
                    35
            );


            // =============================================
            // LIGHT BLUE BACKGROUND
            // PDFBOX 3 COLOR FIX
            // =============================================

            stream.setNonStrokingColor(
                    new Color(
                            239,
                            246,
                            255
                    )
            );


            stream.addRect(
                    PAGE_MARGIN,
                    y - 5,
                    CONTENT_WIDTH,
                    24
            );


            stream.fill();


            // =============================================
            // BLUE TITLE
            // =============================================

            stream.setNonStrokingColor(
                    new Color(
                            30,
                            64,
                            175
                    )
            );


            writeTextAt(
                    clean(
                            title
                    ),
                    FONT_BOLD,
                    11,
                    PAGE_MARGIN + 10,
                    y + 3
            );


            // =============================================
            // RESET
            // =============================================

            stream.setNonStrokingColor(
                    Color.BLACK
            );


            y -=
                    32;
        }


        // =================================================
        // DETAIL
        // =================================================

        void writeDetail(
                String label,
                String value)
                throws IOException {

            ensureSpace(
                    29
            );


            writeTextAt(
                    clean(
                            label
                    ),
                    FONT_BOLD,
                    9.5f,
                    PAGE_MARGIN,
                    y
            );


            y -=
                    13;


            List<String> valueLines =
                    wrapText(
                            clean(
                                    value
                            ),
                            FONT_REGULAR,
                            10.5f,
                            CONTENT_WIDTH
                    );


            for (String line :
                    valueLines) {

                ensureSpace(
                        14
                );


                writeTextAt(
                        line,
                        FONT_REGULAR,
                        10.5f,
                        PAGE_MARGIN,
                        y
                );


                y -=
                        14;
            }


            y -=
                    5;
        }


        // =================================================
        // SEPARATOR
        // =================================================

        void drawSeparator()
                throws IOException {

            ensureSpace(
                    10
            );


            // =============================================
            // PDFBOX 3 COLOR FIX
            // =============================================

            stream.setStrokingColor(
                    new Color(
                            203,
                            213,
                            225
                    )
            );


            stream.setLineWidth(
                    0.7f
            );


            stream.moveTo(
                    PAGE_MARGIN,
                    y
            );


            stream.lineTo(
                    page
                            .getMediaBox()
                            .getWidth()
                            - PAGE_MARGIN,
                    y
            );


            stream.stroke();


            stream.setStrokingColor(
                    Color.BLACK
            );


            y -=
                    5;
        }


        // =================================================
        // SPACE
        // =================================================

        void addSpace(
                float amount)
                throws IOException {

            if (amount <= 0) {

                return;
            }


            ensureSpace(
                    amount
            );


            y -=
                    amount;
        }


        // =================================================
        // WRITE TEXT
        // =================================================

        private void writeTextAt(
                String text,
                PDFont font,
                float size,
                float x,
                float y)
                throws IOException {

            if (stream == null) {

                throw new IOException(
                        "PDF content stream is not available"
                );
            }


            if (font == null) {

                throw new IOException(
                        "PDF font is not available"
                );
            }


            String safe =
                    clean(
                            text
                    );


            stream.beginText();


            boolean textModeOpen =
                    true;


            try {

                stream.setFont(
                        font,
                        size
                );


                stream.newLineAtOffset(
                        x,
                        y
                );


                stream.showText(
                        safe
                );


                stream.endText();


                textModeOpen =
                        false;

            } finally {

                /*
                 * If something fails after beginText(),
                 * try to close PDFBox text mode safely.
                 */

                if (textModeOpen) {

                    try {

                        stream.endText();

                    } catch (Exception ignored) {

                        // Preserve original exception.
                    }
                }
            }
        }


        // =================================================
        // WRAP TEXT
        // =================================================

        private List<String> wrapText(
                String text,
                PDFont font,
                float size,
                float maxWidth)
                throws IOException {

            List<String> lines =
                    new ArrayList<>();


            String safe =
                    clean(
                            text
                    );


            if (safe.isBlank()) {

                lines.add(
                        ""
                );

                return lines;
            }


            String[] paragraphs =
                    safe.split(
                            "\\r?\\n"
                    );


            for (String paragraph :
                    paragraphs) {

                if (paragraph == null ||
                        paragraph.isBlank()) {

                    lines.add(
                            ""
                    );

                    continue;
                }


                String[] words =
                        paragraph
                                .trim()
                                .split(
                                        "\\s+"
                                );


                StringBuilder current =
                        new StringBuilder();


                for (String word :
                        words) {

                    if (word == null ||
                            word.isBlank()) {

                        continue;
                    }


                    String candidateLine =
                            current.length() == 0

                                    ? word

                                    : current
                                    + " "
                                    + word;


                    float width =
                            getTextWidth(
                                    candidateLine,
                                    font,
                                    size
                            );


                    if (width <= maxWidth) {

                        current =
                                new StringBuilder(
                                        candidateLine
                                );

                    } else {

                        if (current.length() > 0) {

                            lines.add(
                                    current.toString()
                            );
                        }


                        /*
                         * Split very long text such as
                         * URLs instead of overflowing.
                         */

                        if (getTextWidth(
                                word,
                                font,
                                size
                        ) > maxWidth) {

                            List<String> splitWord =
                                    splitLongWord(
                                            word,
                                            font,
                                            size,
                                            maxWidth
                                    );


                            for (
                                    int i = 0;
                                    i < splitWord.size() - 1;
                                    i++
                            ) {

                                lines.add(
                                        splitWord.get(
                                                i
                                        )
                                );
                            }


                            if (!splitWord.isEmpty()) {

                                current =
                                        new StringBuilder(
                                                splitWord.get(
                                                        splitWord.size() - 1
                                                )
                                        );

                            } else {

                                current =
                                        new StringBuilder();
                            }

                        } else {

                            current =
                                    new StringBuilder(
                                            word
                                    );
                        }
                    }
                }


                if (current.length() > 0) {

                    lines.add(
                            current.toString()
                    );
                }
            }


            return lines;
        }


        // =================================================
        // SPLIT LONG WORD
        // =================================================

        private List<String> splitLongWord(
                String word,
                PDFont font,
                float size,
                float maxWidth)
                throws IOException {

            List<String> parts =
                    new ArrayList<>();


            if (word == null ||
                    word.isBlank()) {

                return parts;
            }


            StringBuilder current =
                    new StringBuilder();


            for (char character :
                    word.toCharArray()) {

                String candidate =
                        current.toString()
                                + character;


                if (getTextWidth(
                        candidate,
                        font,
                        size
                ) <= maxWidth) {

                    current.append(
                            character
                    );

                } else {

                    if (current.length() > 0) {

                        parts.add(
                                current.toString()
                        );
                    }


                    current =
                            new StringBuilder();


                    current.append(
                            character
                    );
                }
            }


            if (current.length() > 0) {

                parts.add(
                        current.toString()
                );
            }


            return parts;
        }


        // =================================================
        // TEXT WIDTH
        // =================================================

        private float getTextWidth(
                String text,
                PDFont font,
                float size)
                throws IOException {

            return font
                    .getStringWidth(
                            clean(
                                    text
                            )
                    ) /
                    1000f *
                    size;
        }


        // =================================================
        // CLEAN TEXT
        // =================================================

        private String clean(
                String value) {

            return safePdfText(
                    value
            );
        }


        // =================================================
        // FINISH
        // =================================================

        void finish()
                throws IOException {

            closeCurrentStream();
        }
    }
}