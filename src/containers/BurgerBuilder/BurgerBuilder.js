import React , {Component} from 'react';
import Burger from '../../components/Burger/Burger';
import Aux from '../../hoc/Auxiliary/Auxiliary';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7,
}
class BurgerBuilder extends Component {
    state = {
        ingredients: {
            salad: 0,
            bacon: 0,
            meat: 0,
            cheese: 0
        },
        totaPrice: 4,
        purchaseable: false,
        purchasing: false,
        loading: false
    }
    
    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updateCount = oldCount + 1;
        const updateIngredients = {
            ...this.state.ingredients
        };
        updateIngredients[type] = updateCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totaPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totaPrice: newPrice,  ingredients: updateIngredients});
        this.updatePurchaseState(updateIngredients);
    };

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
        const updateCount = oldCount - 1;
        const updateIngredients = {
            ...this.state.ingredients
        };
        updateIngredients[type] = updateCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totaPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({totaPrice: newPrice,  ingredients: updateIngredients});
        this.updatePurchaseState(updateIngredients);
    };

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map( igkey => {
                return ingredients[igkey];
            })
            .reduce((sum,el) => {
                return sum + el;
            }, 0);

        this.setState({purchaseable: sum > 0})  
    };

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        //alert('you continue!');
        this.setState({loading : true});
        const order = {
            ingredients : this.state.ingredients,
            price : this.state.totaPrice,
            customer: {
                name : 'Mohan',
                address: {
                    street: '1 lavas place',
                    zipcode: '1060',
                    country: 'New Zealand'
                },
                email: 'mohankumar.be.cse@gmail.com'
            },
            deliveryMethod: 'fastest'
        }
        axios.post('/orders.json', order)
           .then(response => {
                    this.setState({loading: false, purchasing: false});
                })
            .catch(error => {
                this.setState({loading: false,purchasing: false});
            });
    }

    render() {
        const disableInfo = {
            ...this.state.ingredients
        }
        for(let key in disableInfo) {
            disableInfo[key] = disableInfo[key] <= 0
        }
        let orderSummary = <OrderSummary 
            ingredients={this.state.ingredients} 
            price={this.state.totaPrice}
            purchaseCancelled={this.purchaseCancelHandler}
            purchaseContinued={this.purchaseContinueHandler}
            />
        if(this.state.loading) {
            orderSummary = <Spinner />;
        }
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                <Burger ingredients= {this.state.ingredients}/>
                <BuildControls 
                    ingredientAdded={this.addIngredientHandler}
                    ingredientRemoved={this.removeIngredientHandler}
                    disabled={disableInfo}
                    price={this.state.totaPrice}
                    purchaseable={this.state.purchaseable}
                    ordered={this.purchaseHandler}
                    />
                    
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);