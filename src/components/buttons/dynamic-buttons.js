// props: id, bootstrapTheme, vhSize
export const SpinnerButton = (props) => {
    return (
        <>
        <div id={`button-${props.id || ''}`} style={{cursor:"pointer"}}>
            { props.children }
        </div>
        <div id={`spinner-${props.id || ''}`} className={`spinner-border mt-1 text-${props.bootstrapTheme || 'light'}`} hidden={true} role="status" style={{height:`${props.vhSize || 2.5}vh`, width:`${props.vhSize || 2.5}vh`}}>
            <span className="visually-hidden">Loading...</span>
        </div>
        </>
    )}