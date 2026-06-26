package com.camp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/admin")
    public String adminLogin() {
        return "redirect:/admin/";
    }

    @GetMapping("/admin/")
    public String adminIndex() {
        return "forward:/admin/index.html";
    }


    @GetMapping("/console")
    public String console() {
        return "forward:/console/index.html";
    }

    @GetMapping("/model")
    public String model() {
        return "forward:/model-test.html";
    }

    @GetMapping("/bloom")
    public String bloom() {
        return "forward:/bloom-admin.html";
    }
}
