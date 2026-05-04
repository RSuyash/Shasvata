from shasvata_core.scoring.compensation import compensation_score
from shasvata_core.scoring.credibility import credibility_score
from shasvata_core.scoring.impact import impact_score
from shasvata_core.scoring.responsibility_ratio import responsibility_ratio
from shasvata_core.scoring.vbi import value_based_impact_score


def test_scoring_functions_return_bounded_foundation_values():
    assert impact_score(emissions_intensity=3.0, renewable_share=20.0) == 64.0
    assert compensation_score(worker_benefit_ratio=0.5, living_wage_coverage=0.6) == 56.0
    assert credibility_score(reviewed_metric_share=0.8, grade="B") == 68.0
    assert value_based_impact_score(64.0, 56.0, 68.0) == 62.666666666666664


def test_responsibility_ratio_handles_zero_externality():
    assert responsibility_ratio(positive_action_value=10.0, negative_externality_value=0.0) == 10.0
    assert responsibility_ratio(positive_action_value=10.0, negative_externality_value=5.0) == 2.0
