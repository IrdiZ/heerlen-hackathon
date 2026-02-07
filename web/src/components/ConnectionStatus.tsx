'use client';

interface ConnectionStatusProps {
  elevenLabsConnected: boolean;
  extensionConnected: boolean;
}

export function ConnectionStatus({ elevenLabsConnected, extensionConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${elevenLabsConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={elevenLabsConnected ? 'text-green-700' : 'text-gray-500'}>
          Voice AI
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${extensionConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className={extensionConnected ? 'text-green-700' : 'text-yellow-600'}>
          Extension {!extensionConnected && '(optional)'}
        </span>
      </div>
    </div>
  );
}
