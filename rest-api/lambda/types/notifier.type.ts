export type NotifyType = {
    userId: string;
    message: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
};
