package com.jobtrack.repository;

import com.jobtrack.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByApplicationAssessmentId(Long applicationAssessmentId);
}
