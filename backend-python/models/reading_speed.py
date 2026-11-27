from enum import Enum

from pydantic import BaseModel


class WordStatus(str, Enum):
    CORRECT = "correct"
    ERROR = "error"
    SKIPPED = "skipped"
    NOT_IN_VOCABULARY = "not_in_vocabulary"
    NOT_REACHED = "not_reached"


class ReferenceWord(BaseModel):
    index: int
    word: str
    in_vocabulary: bool
    display: str


class ReferenceText(BaseModel):
    id: str
    title: str
    words: list[ReferenceWord]


class WordEvent(BaseModel):
    type: str = "word_event"
    index: int
    status: WordStatus
    tentative: bool = False


class ReadingSpeedMetrics(BaseModel):
    total_words: int
    correct_count: int
    error_count: int
    skipped_count: int
    not_in_vocabulary_count: int
    duration_seconds: float
    wpm: float
    accuracy: float


class ComprehensionAnswer(BaseModel):
    answer: str
    correct: bool


class ComprehensionQuestion(BaseModel):
    question: str
    quote: str
    answers: list[ComprehensionAnswer]


class ReadingSpeedResult(BaseModel):
    type: str = "result"
    text_id: str
    metrics: ReadingSpeedMetrics
    attempt_id: int | None = None
    quiz: list[ComprehensionQuestion] | None = None
