package com.taskmanager.taskmanager.feature.attachment;


import com.taskmanager.taskmanager.feature.ticket.Ticket;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "attachments")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @ManyToOne
    private Ticket ticket;

    private String filename;
    private String fileUrl; // URL or path to the stored file
    private String fileType; // MIME type of the file
    private Long fileSize; // Size of the file in bytes

    private LocalDateTime uploadedAt; // Timestamp of when the file was uploaded
}
