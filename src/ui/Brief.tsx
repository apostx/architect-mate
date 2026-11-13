import type { Challenge } from "../challenges/challenge";

/** The challenge's scenario, requirements and roles, in a strip above the canvas. */
export function Brief({ challenge }: { challenge: Challenge }) {
  const roles = challenge.task.roles ?? [];
  return (
    <section className="brief" aria-label="Challenge">
      <div className="brief-scenario">
        <h2 className="panel-heading">Scenario</h2>
        {challenge.scenario.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="brief-requirements">
        <h2 className="panel-heading">Requirements</h2>
        <ol>
          {challenge.task.requirements.map((requirement) => (
            <li key={requirement.id}>{requirement.description ?? requirement.id}</li>
          ))}
        </ol>
        {roles.map((role) => (
          <p key={role.id} className="brief-roles">
            Give the role <span className="role-badge">{role.label ?? role.id}</span> to a component
            in your design{role.description ? `: ${role.description.toLowerCase()}` : "."}
          </p>
        ))}
      </div>
    </section>
  );
}
