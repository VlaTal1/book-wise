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
public class StressProgressUpdateDTO {

    private StressStatus status;

    private Integer progress;
}
