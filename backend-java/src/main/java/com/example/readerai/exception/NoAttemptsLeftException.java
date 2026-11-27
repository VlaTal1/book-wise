package com.example.readerai.exception;

public class NoAttemptsLeftException extends RuntimeException {
    public NoAttemptsLeftException(String message) {
        super(message);
    }
}
