import React, { Component } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";

class home extends Component {
  state = {
    screams: null
  };
  componentDidMount() {
    axios
      .get("/screams")
      .then(res => {
        this.setState({
          screams: res.data
        });
      })
      .catch(err => console.log(err));
  }
  render() {
    let recentScreamMarkup = this.state.screams ? (
      this.state.screams.map(scream => <p>{scream.body}</p>)
    ) : <p>Loading</p>
    return (
      <Grid container spacing={2}>
        <Grid container item sm={8} xs={12}>
          {recentScreamMarkup}
        </Grid>
        <Grid container item sm={4} xs={12}>
          <p>Profile...</p>
        </Grid>
      </Grid>
    );
  }
}

export default home;
