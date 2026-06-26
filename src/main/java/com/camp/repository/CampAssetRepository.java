package com.camp.repository;

import com.camp.domain.CampAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampAssetRepository extends JpaRepository<CampAsset, String> {
    List<CampAsset> findByStatus(String status);
}
