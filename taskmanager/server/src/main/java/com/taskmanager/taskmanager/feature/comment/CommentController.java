package com.taskmanager.taskmanager.feature.comment;


import com.taskmanager.taskmanager.feature.comment.dto.CommentRequestDTO;
import com.taskmanager.taskmanager.feature.comment.dto.CommentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    //add comment to a ticket

    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(@PathVariable Long ticketId, @RequestBody CommentRequestDTO dto, Authentication authentication) {
        String authorEmail = authentication.getName();
        CommentResponseDTO createdComment = commentService.addComment(ticketId, dto, authorEmail);
        return ResponseEntity.ok(createdComment);
    }


    @GetMapping("tickets/{ticketId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getAllComments(@PathVariable Long ticketId, Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(commentService.getAllComments(ticketId, userEmail));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        String userEmail = authentication.getName();
        commentService.deleteComment(commentId, userEmail);
        return ResponseEntity.ok("Comment deleted successfully");
}}
