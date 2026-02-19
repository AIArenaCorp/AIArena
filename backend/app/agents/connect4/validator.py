from pydantic import BaseModel, field_validator

class Connect4AIWeights(BaseModel):
    create4: int
    create3: int
    create2: int
    create1: int
    block3: int
    block2: int
    block1: int

    @field_validator('*')
    @classmethod
    def check_non_negative(cls, v):
        if v < 0:
            raise ValueError("Weights cannot be negative")
        return v