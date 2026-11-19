import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';

// Light/dark switch for the home header on phones and tablets. Fumadocs only
// shows its theme switch inside the opened mobile menu; this puts it in the
// header bar beside search and the menu button. Positioned by the
// .pbi-mobile-theme rules at the end of app/global.css.
export function MobileThemeToggle() {
  return (
    <div className="pbi-mobile-theme lg:hidden">
      <ThemeSwitch className="pbi-theme-btn" />
    </div>
  );
}
