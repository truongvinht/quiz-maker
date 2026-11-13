interface HomeTitleProps {
  children: React.ReactNode;
  onHome: () => void; // called only after the user confirms
  confirmMessage?: string;
}

const DEFAULT_CONFIRM_MESSAGE = 'Go back to the topic overview?';

// Page title in the header that links back to the topic overview. Always asks first (owner's
// choice), so a stray click never throws away a running quiz.
export default function HomeTitle({ children, onHome, confirmMessage = DEFAULT_CONFIRM_MESSAGE }: HomeTitleProps) {
  return (
    <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">
      <button
        type="button"
        title="Back to the topic overview"
        className="cursor-pointer rounded-sm hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => {
          if (window.confirm(confirmMessage)) onHome();
        }}
      >
        {children}
      </button>
    </h1>
  );
}
