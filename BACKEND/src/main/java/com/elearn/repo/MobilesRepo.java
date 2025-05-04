package com.elearn.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elearn.model.Mobiles;
@Repository
public interface MobilesRepo extends JpaRepository<Mobiles, Long> {

}
