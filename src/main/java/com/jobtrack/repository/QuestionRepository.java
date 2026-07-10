package com.jobtrack.repository;

import com.jobtrack.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByAssessmentIdOrderByOrderIndexAsc(Long assessmentId);
}
