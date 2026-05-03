from shasvata_core.validation.confidence import confidence_grade_multiplier


def test_confidence_grade_multiplier_supports_all_foundation_grades():
    assert confidence_grade_multiplier("A") == 1.0
    assert confidence_grade_multiplier("B") == 0.85
    assert confidence_grade_multiplier("C") == 0.6
    assert confidence_grade_multiplier("D") == 0.25
