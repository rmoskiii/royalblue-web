import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/api/services/auth';
import { queryKeys } from '@/api/hooks';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { Card, PageHeader, Switch } from '@/components/ui';
import { SettingsBack } from './SettingsBack';

export function NotificationsSettingsPage() {
  const queryClient = useQueryClient();
  const { data: security } = useQuery({
    queryKey: queryKeys.security,
    queryFn: authService.getSecurity,
  });
  const save = useMutation({
    mutationFn: (body: {
      loginAlertsEnabled?: boolean;
      transactionAlertsEnabled?: boolean;
      marketingEmailsEnabled?: boolean;
    }) => authService.setAlerts(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.security }),
  });

  if (!security) return null;

  return (
    <>
      <SettingsBack />
      <PageHeader
        title="Notifications"
        subtitle="Choose which emails we send. The bell on Home is your in-app list."
      />
      <p className="mx-auto mb-3 max-w-xl text-[13px]">
        <Link to={paths.notifications} className="font-medium text-brand hover:underline">
          Open your in-app notifications
        </Link>
      </p>
      <div className="mx-auto grid max-w-xl gap-3">
        <Card>
          <Switch
            label="Sign-in alerts"
            description="Email when a new browser or phone signs in."
            checked={security.loginAlertsEnabled}
            onChange={(on) => save.mutate({ loginAlertsEnabled: on })}
          />
        </Card>
        <Card>
          <Switch
            label="Transaction alerts"
            description="Credits, debits and failed transfers."
            checked={security.transactionAlertsEnabled ?? true}
            onChange={(on) => save.mutate({ transactionAlertsEnabled: on })}
          />
        </Card>
        <Card>
          <Switch
            label="Offers and updates"
            description="Product news. Never used for sign-in codes or receipts."
            checked={security.marketingEmailsEnabled ?? false}
            onChange={(on) => save.mutate({ marketingEmailsEnabled: on })}
          />
        </Card>
      </div>
    </>
  );
}
