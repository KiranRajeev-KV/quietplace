import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { writingRepository } from '../data/repository';
export function NewManuscript() {
  const navigate = useNavigate(),
    create = useMutation({
      mutationFn: () => writingRepository.create(),
      onSuccess: (piece) =>
        navigate({ to: '/studio/$id', params: { id: piece.id }, replace: true }),
    });
  return (
    <section className="desk-new wrap">
      <p className="micro">A NEW MANUSCRIPT</p>
      <h1>
        Begin with
        <br />
        <em>a thought.</em>
      </h1>
      <p>The title can come later.</p>
      <button
        type="button"
        className="desk-primary"
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? 'Opening a fresh page…' : 'Open a fresh page ↗'}
      </button>
      {create.error && (
        <p role="alert" className="desk-error">
          {create.error.message}
        </p>
      )}
      <Link to="/studio" className="text-link">
        ← The notebook
      </Link>
    </section>
  );
}
