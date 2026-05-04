INSERT INTO core.entities (slug, name, sector, status)
VALUES
  ('reliance-industries-limited', 'Reliance Industries Limited', 'Energy and Materials', 'sample'),
  ('tata-steel-limited', 'Tata Steel Limited', 'Metals', 'sample'),
  ('infosys-limited', 'Infosys Limited', 'Information Technology', 'sample')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO intelligence.metric_definitions (key, label, unit, status)
VALUES
  ('scope_1_emissions', 'Scope 1 emissions', 'MtCO2e', 'sample'),
  ('renewable_power_share', 'Renewable power share', '%', 'sample'),
  ('water_recycled', 'Water recycled', '%', 'sample')
ON CONFLICT (key) DO NOTHING;

INSERT INTO intelligence.methodology_versions (key, version, status, metadata)
VALUES
  ('foundation', 'foundation-0.1', 'sample', '{"notice":"Foundation sample methodology. Not final research."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
