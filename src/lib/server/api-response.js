import { NextResponse } from 'next/server';

export function jsonOk(data, init = 200) {
  const responseInit = typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, responseInit);
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
