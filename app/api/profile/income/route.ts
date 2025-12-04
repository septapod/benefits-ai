import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getIncomeSources, createIncomeSource } from '@/lib/supabase/profile';
import { IncomeSourceInput } from '@/lib/types/profile';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getIncomeSources(supabase, user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: IncomeSourceInput = await request.json();

    // Validate required fields
    if (!body.income_type || !body.source_name || body.amount === undefined || !body.frequency) {
      return NextResponse.json(
        { error: 'Missing required fields: income_type, source_name, amount, frequency' },
        { status: 400 }
      );
    }

    const result = await createIncomeSource(supabase, user.id, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
