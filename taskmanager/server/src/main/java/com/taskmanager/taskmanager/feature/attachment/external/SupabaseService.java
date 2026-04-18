package com.taskmanager.taskmanager.feature.attachment.external;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupabaseService {

    private final RestTemplate restTemplate;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket-name:}")
    private String bucketName;

    public String uploadFile(MultipartFile file) {
        try {
            if (supabaseUrl.isBlank() || supabaseKey.isBlank() || bucketName.isBlank()) {
                throw new IllegalStateException("Supabase configuration is incomplete");
            }

            String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String fileName = UUID.randomUUID() + "_" + originalName;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);
            headers.set("apikey", supabaseKey);
            String contentType = file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType();
            headers.setContentType(MediaType.parseMediaType(contentType));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName,
                    HttpMethod.PUT,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
            }

            throw new RuntimeException("Failed to upload file to Supabase");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Supabase", e);
        }
    }
}
