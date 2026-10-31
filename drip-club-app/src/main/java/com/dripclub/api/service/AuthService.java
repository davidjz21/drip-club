package com.dripclub.api.service;

import com.dripclub.api.dto.LoginRequest;
import com.dripclub.api.dto.LoginResponse;

public interface AuthService {
    LoginResponse autenticarAdmin(LoginRequest request);
}