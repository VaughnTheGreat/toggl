import { Link, useLocation } from 'react-router-dom';
import Screen from '@/components/game/Screen';


export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <Screen className="pb-12">
            <div className="text-center space-y-6 pt-16">
                <div className="space-y-2">
                    <h1 className="text-7xl font-extrabold text-muted-foreground/40">404</h1>
                    <div className="h-0.5 w-16 bg-border mx-auto"></div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-extrabold">Page Not Found</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        The page <span className="font-bold text-foreground">"{pageName}"</span> doesn't exist.
                    </p>
                </div>
                <div className="pt-4">
                    <Link to="/" className="text-sm font-bold text-primary">← Go Home</Link>
                </div>
            </div>
        </Screen>
    )
}
