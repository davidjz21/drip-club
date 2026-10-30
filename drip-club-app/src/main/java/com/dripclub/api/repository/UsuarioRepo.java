package com.dripclub.api.repository;

import com.dripclub.api.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepo extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
}
