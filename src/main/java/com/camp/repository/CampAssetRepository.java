package com.camp.repository;

import com.camp.domain.CampAsset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampAssetRepository extends JpaRepository<CampAsset, String> {
}
