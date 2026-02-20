from pydantic import BaseModel, field_validator

class Connect4AIWeights(BaseModel):
    depth: int
    create4: int
    create3: int
    create2: int
    opponent4: int
    opponent3: int
    opponent2: int

    @field_validator('*')
    @classmethod
    def check_non_negative(cls, v):
        if v < 0:
            raise ValueError("Weights cannot be negative")
        return v