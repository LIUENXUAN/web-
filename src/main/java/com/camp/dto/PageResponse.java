package com.camp.dto;

import java.util.List;

public class PageResponse<T> {
    private List<T> content;
    private int totalPages;
    private long totalElements;
    private int size;
    private int number;

    public PageResponse() {}

    public PageResponse(List<T> content, int totalPages, long totalElements, int size, int number) {
        this.content = content;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.size = size;
        this.number = number;
    }

    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getTotalPages(), page.getTotalElements(), page.getSize(), page.getNumber());
    }

    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }
}
