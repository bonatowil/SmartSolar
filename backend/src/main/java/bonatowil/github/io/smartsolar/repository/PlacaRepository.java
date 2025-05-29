package bonatowil.github.io.smartsolar.repository;

import bonatowil.github.io.smartsolar.entity.Placa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlacaRepository extends JpaRepository<Placa, Long> {
    @Query("""
    SELECT p FROM Placa p
    WHERE (:descricao IS NULL OR p.descricao LIKE %:descricao%)
      AND (:marca IS NULL OR p.marca LIKE %:marca%)
      AND (:modelo IS NULL OR p.modelo LIKE %:modelo%)
    """)
    List<Placa> findAllFilter(@Param("descricao") String descricao, @Param("marca") String marca, @Param("modelo") String modelo);
}
