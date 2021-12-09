export default {
  option: (provided, state) => ({
    ...provided,

    // borderBottom: '1px dotted pink',
    // color: state.isSelected ? 'red' : 'blue',
    // padding: 20,
  }),
  control: () => ({
    // none of react-select's styles are passed to <Control />
    // width: 200,
    'display': 'flex',
  }),
  indicatorsContainer: () => ({
    'width': '3px',
    'height': '3px',
    'color': '#212529',
    'box-shadow': '3px 3px 0 0.02em, 6px 3px 0 0.02em, 9px 3px 0 0.02em, 12px 3px 0 0.02em, 15px 3px 0 0.02em, 18px 3px 0 0.02em, 21px 3px 0 0.02em, 3px 6px 0 0.02em, 6px 6px 0 0.02em, 9px 6px 0 0.02em, 12px 6px 0 0.02em, 15px 6px 0 0.02em, 18px 6px 0 0.02em, 21px 6px 0 0.02em, 6px 9px 0 0.02em, 9px 9px 0 0.02em, 12px 9px 0 0.02em, 15px 9px 0 0.02em, 18px 9px 0 0.02em, 6px 12px 0 0.02em, 9px 12px 0 0.02em, 12px 12px 0 0.02em, 15px 12px 0 0.02em, 18px 12px 0 0.02em, 9px 15px 0 0.02em, 12px 15px 0 0.02em, 15px 15px 0 0.02em, 12px 18px 0 0.02em',
    'transform': 'translateX(-32px) translateY(6px)',
  }),
  container: () => ({
    'padding': 4,
    'border': '4px solid #000',
    'border-image-source': `url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="rgb(33,37,41)" /></svg>')`,
    'border-image-slice': '2',
    'border-image-width': '2',
    'border-image-outset': '2',
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return { ...provided, opacity, transition };
  }
};
