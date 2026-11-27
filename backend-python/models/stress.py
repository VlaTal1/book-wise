from pydantic import BaseModel


class StressWordVerdict(BaseModel):
    index: int
    word: str
    checked: bool
    correct: bool | None = None
    predicted_syllable: int | None = None
    reference_syllables: list[int] | None = None


class StressCheckResult(BaseModel):
    status: str
    accuracy: float | None
    checked_words: int
    correct_words: int
    words: list[StressWordVerdict]
