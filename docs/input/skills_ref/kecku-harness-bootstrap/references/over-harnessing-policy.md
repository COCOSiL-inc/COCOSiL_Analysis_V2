# Over-Harnessing Policy

Do not add a rule, hook, skill, subagent, or eval unless:

1. There is a concrete failure or repeated workflow.
2. The failure is likely to recur.
3. Existing lint/test/typecheck cannot catch it.
4. The cost is smaller than the expected improvement.
5. There is a measurable signal.

Delete candidates:

- Unused hooks.
- Long generic rules.
- LLM reviews replaced by deterministic checks.
- Vague skills with poor routing.
- Rules made obsolete by newer models or better tests.
