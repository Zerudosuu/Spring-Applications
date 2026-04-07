package com.taskmanager.taskmanager.feature.comment.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequestDTO {

    @NotBlank(message = "Content must not be blank")
    @Size(max = 1000, message = "Content must not exceed 1000 characters")
    private String content;
}
