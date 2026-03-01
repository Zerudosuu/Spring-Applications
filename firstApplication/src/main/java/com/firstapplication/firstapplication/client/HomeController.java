package com.firstapplication.firstapplication.client;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
public class HomeController {

    @RequestMapping("/")
    public String index() {
        return "index";



    }
    @GetMapping("/settings")
    public String settings() {
        return "settings";
    }

}
