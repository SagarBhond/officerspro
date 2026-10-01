package com.cms.officerspro.repository;

import com.cms.officerspro.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileEntityRepository extends JpaRepository<FileEntity,String> {

}
