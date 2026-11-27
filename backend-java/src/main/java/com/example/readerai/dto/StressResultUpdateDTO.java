package com.example.readerai.dto;

import com.example.readerai.entity.StressStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StressResultUpdateDTO {

    private StressStatus status;

    private Double accuracy;

    private Integer checkedWords;

    private Integer correctWords;

    private String wordsJson;

    private String error;
}
