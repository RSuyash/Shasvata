def scale_to_sector_average(value: float, sector_average: float) -> float:
    if sector_average == 0:
        return 0.0
    return value / sector_average
