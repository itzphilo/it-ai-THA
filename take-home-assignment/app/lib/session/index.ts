import crypto from 'crypto';

function generateSession(name: string): { sessionId: string, name: string } {
  const timestamp = Date.now().toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(timestamp + salt).digest('hex');
  const sessionId = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;

  return {
    sessionId,
    name,
  };
}

export default generateSession;
