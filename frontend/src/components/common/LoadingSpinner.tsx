import '../../styles/components/loading-spinner.css'

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = true,
  text = 'Cargando',
  size = 'medium'
}) => {
  return (
    <div className={`loading-container ${fullScreen ? 'loading-container--fullscreen' : ''}`}>
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner__orbit">
          <div className="loading-spinner__dot"></div>
        </div>
        {text && (
          <span className="loading-spinner__text">{text}</span>
        )}
      </div>
    </div>
  );
};
