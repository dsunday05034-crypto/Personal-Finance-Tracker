export default function ExpenseCard(props) {
    return (
        <div>
            <h1>{props.category}</h1>
            <p>{props.amount}</p>
        </div>
    );
}