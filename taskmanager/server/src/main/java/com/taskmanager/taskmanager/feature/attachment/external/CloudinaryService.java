package com.taskmanager.taskmanager.feature.attachment.external;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            Object secureUrl = uploadResult.get("secure_url");
            return (secureUrl != null ? secureUrl : uploadResult.get("url")).toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

}
