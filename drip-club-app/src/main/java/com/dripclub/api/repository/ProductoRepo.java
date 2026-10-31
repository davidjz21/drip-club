package com.dripclub.api.repository;
import com.dripclub.api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface ProductoRepo extends JpaRepository<Producto, Long> {
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select p from Producto p where p.idProducto = :id")
 Optional<Producto> buscarParaCompra(@Param("id") Long id);
}
