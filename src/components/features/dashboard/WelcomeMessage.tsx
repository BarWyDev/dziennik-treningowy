interface WelcomeMessageProps {
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Dzień dobry';
  if (hour < 18) return 'Cześć';
  return 'Dobry wieczór';
}

export function WelcomeMessage({ userName }: WelcomeMessageProps) {
  const greeting = getGreeting();
  const firstName = userName.split(' ')[0];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
        {greeting}, {firstName}!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1 text-base lg:text-lg">
        Sprawdź swoje postępy i zaplanuj kolejny trening.
      </p>
    </div>
  );
}
