import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground font-body mt-1">Library configuration</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Settings className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm font-body text-muted-foreground">
          Settings will be available in a future update.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
