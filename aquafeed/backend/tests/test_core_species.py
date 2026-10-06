"""
Unit tests for Species Profiles & Stage Registries.
"""

import pytest
from app.core.species_profiles import (
    SPECIES_REGISTRY,
    get_species_config,
    get_stage_config,
)


def test_species_registry_contains_required_species():
    assert "tilapia" in SPECIES_REGISTRY
    assert "rohu" in SPECIES_REGISTRY
    assert "shrimp" in SPECIES_REGISTRY


def test_get_species_config_success_and_aliases():
    tilapia = get_species_config("tilapia")
    assert tilapia.common_name == "Nile Tilapia"

    # Alias / case insensitivity
    rohu = get_species_config("ROHU")
    assert rohu.common_name == "Rohu / Indian Major Carp"

    carp = get_species_config("carp")
    assert carp.common_name == "Rohu / Indian Major Carp"

    shrimp = get_species_config("vannamei")
    assert shrimp.common_name == "Pacific White Shrimp"


def test_get_species_config_invalid():
    with pytest.raises(ValueError) as excinfo:
        get_species_config("atlantic_salmon")
    assert "Unknown species" in str(excinfo.value)


@pytest.mark.parametrize(
    "species,weight_g,expected_stage",
    [
        ("tilapia", 0.5, "fry"),
        ("tilapia", 1.0, "fingerling"),
        ("tilapia", 19.9, "fingerling"),
        ("tilapia", 20.0, "juvenile"),
        ("tilapia", 99.9, "juvenile"),
        ("tilapia", 100.0, "grower"),
        ("tilapia", 399.9, "grower"),
        ("tilapia", 400.0, "finisher"),
        ("tilapia", 1200.0, "finisher"),
        ("rohu", 0.2, "fry"),
        ("rohu", 25.0, "juvenile"),
        ("rohu", 150.0, "grower"),
        ("rohu", 650.0, "finisher"),
        ("shrimp", 0.1, "fry"),
        ("shrimp", 2.0, "fingerling"),
        ("shrimp", 10.0, "juvenile"),
        ("shrimp", 25.0, "grower"),
    ],
)
def test_stage_resolution_boundaries(species, weight_g, expected_stage):
    stage = get_stage_config(species, weight_g)
    assert stage.name == expected_stage
    assert stage.base_feeding_rate_pct > 0.0
    assert stage.crude_protein_pct > 0.0
    assert stage.default_meals_per_day >= 2
