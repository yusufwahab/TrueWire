-- Optional: run after schema.sql to populate your Supabase project with the same illustrative
-- dataset the site ships with as a local fallback (src/data/seed.js). Every claim text is a
-- fictional example, not a report about a real statement by a real named individual.

insert into sources (name, type, homepage_url) values
  ('Punch', 'news', 'https://punchng.com'),
  ('Vanguard', 'news', 'https://www.vanguardngr.com'),
  ('Premium Times', 'news', 'https://www.premiumtimesng.com'),
  ('TheCable', 'news', 'https://www.thecable.ng'),
  ('Daily Trust', 'news', 'https://dailytrust.com'),
  ('Channels TV', 'news', 'https://www.channelstv.com'),
  ('The Guardian Nigeria', 'news', 'https://guardian.ng'),
  ('PM News', 'news', 'https://pmnewsnigeria.com'),
  ('Dubawa', 'factcheck', 'https://dubawa.org'),
  ('FactCheckHub', 'factcheck', 'https://factcheckhub.com'),
  ('Africa Check', 'factcheck', 'https://africacheck.org'),
  ('CDD Fact-check', 'factcheck', 'https://cddfactcheck.org')
on conflict (name) do nothing;

insert into claims (slug, text, category, verdict, confidence, explanation, first_reported_at) values
  ('cbn-new-5000-note', 'Video claims the Central Bank has begun printing a new ₦5,000 note set for release next month.', 'Finance', 'disputed', 0.88,
    'The video circulating on WhatsApp reuses footage from a 2022 currency redesign briefing. The Central Bank has issued no notice of a new ₦5,000 denomination, and three of the newsrooms we track ran explicit denials this week.', now() - interval '9 hours'),
  ('lagos-flood-alert-warning', 'Message forwarded on WhatsApp warns of an imminent flood alert for Lagos Island this weekend.', 'Security', 'unconfirmed', 0.41,
    'We have not found a matching advisory from Lagos State Emergency Management or the Nigerian Meteorological Agency yet. This stays unconfirmed rather than dismissed, and is queued for review.', now() - interval '4 hours'),
  ('free-fuel-palliative-registration', 'Post claims citizens can register online for a one-off ₦50,000 fuel subsidy palliative payment.', 'Politics', 'disputed', 0.93,
    'This is a recurring scam format that resurfaces under a new payment figure every few months, designed to harvest BVN and bank details through a fake registration link.', now() - interval '20 hours'),
  ('malaria-vaccine-nafdac-approval', 'Claim that NAFDAC has approved a new locally-manufactured malaria vaccine for nationwide rollout.', 'Health', 'verified', 0.9,
    'NAFDAC''s own bulletin and two independent newsroom reports corroborate a phased rollout beginning in select states, consistent with the claim.', now() - interval '30 hours'),
  ('afrobeats-award-boycott', 'Rumour that a top Afrobeats act is boycotting this year''s awards show over a scoring dispute.', 'Entertainment', 'unconfirmed', 0.35,
    'Entertainment blogs are amplifying a screenshot with no verifiable source account attached. Neither party has issued a statement yet.', now() - interval '2 hours'),
  ('national-id-deadline-extension', 'Claim that the deadline to link National ID numbers to SIM cards has been extended by six months.', 'Politics', 'verified', 0.86,
    'NIMC''s press statement and coverage across four tracked newsrooms confirm an extension, though the exact new date varies slightly between reports.', now() - interval '50 hours'),
  ('kidnapping-spike-highway-video', 'Circulating video alleges a sharp spike in highway kidnappings on a major interstate expressway this week.', 'Security', 'disputed', 0.72,
    'The video''s timestamp metadata and visible signage trace it to a different incident from over a year ago in another state.', now() - interval '13 hours'),
  ('school-resumption-date-change', 'Post claims all public schools nationwide have shifted resumption to a new date after the break.', 'Politics', 'unconfirmed', 0.38,
    'Resumption dates are set at state level in Nigeria, not nationally, so a single blanket date is inherently suspect.', now() - interval '6 hours')
on conflict (slug) do nothing;

insert into claim_sources (claim_id, source_id, article_url, stance)
select c.id, s.id, s.homepage_url, v.stance
from (values
  ('cbn-new-5000-note', 'Premium Times', 'contradicts'),
  ('cbn-new-5000-note', 'Dubawa', 'contradicts'),
  ('cbn-new-5000-note', 'Channels TV', 'contradicts'),
  ('free-fuel-palliative-registration', 'Vanguard', 'contradicts'),
  ('free-fuel-palliative-registration', 'FactCheckHub', 'contradicts'),
  ('malaria-vaccine-nafdac-approval', 'The Guardian Nigeria', 'corroborates'),
  ('malaria-vaccine-nafdac-approval', 'Premium Times', 'corroborates'),
  ('national-id-deadline-extension', 'TheCable', 'corroborates'),
  ('national-id-deadline-extension', 'Daily Trust', 'corroborates'),
  ('kidnapping-spike-highway-video', 'PM News', 'contradicts')
) as v(claim_slug, source_name, stance)
join claims c on c.slug = v.claim_slug
join sources s on s.name = v.source_name
on conflict (claim_id, source_id) do nothing;

-- A light spread of hourly report-count buckets per claim, for the sparkline.
insert into claim_reports (claim_id, bucket_at, count)
select c.id, now() - (n || ' hours')::interval, greatest(1, round(30 * exp(-n * 0.35) + random() * 4))
from claims c
cross join generate_series(11, 0, -1) as n;

insert into insights (slug, title, excerpt, category, hero_image_query, body, published_at) values
  ('why-whatsapp-forwards-spread-faster', 'Why WhatsApp forwards outrun corrections in Nigeria',
    'A look at the mechanics of forwarded-message spread — and why a correction posted hours later rarely catches up.',
    'Methodology', 'Nigeria smartphone crowd',
    '["Forwarded messages do not behave like public posts. There is no visible reply count, no correction thread, and no algorithm demoting a debunked claim once it is shown to be false.", "That asymmetry is the core problem this platform is built around: detection has to be faster than the forward button, not just eventually accurate."]'::jsonb,
    now() - interval '4 days'),
  ('reading-a-verdict-confidence-score', 'How to read a verdict, and what ''unconfirmed'' actually means',
    'Unconfirmed is not a shrug. Here is what is happening behind that verdict, and why we would rather say it than guess.',
    'Methodology', 'Nigeria newsroom',
    '["A confidence score reflects how strongly the available evidence agrees, not how important the claim is.", "Unconfirmed specifically means our archive does not yet have a strong enough match either way, and the claim has been queued for a closer look."]'::jsonb,
    now() - interval '7 days'),
  ('election-season-claim-patterns', 'The claim patterns that repeat every election season',
    'Recurring formats we see resurface every cycle, from fake result sheets to voided-PVC rumours.',
    'Trend recap', 'Nigeria street election',
    '["Several claim formats resurface almost unchanged from one election cycle to the next, just with new names and dates swapped in."]'::jsonb,
    now() - interval '16 days')
on conflict (slug) do nothing;
