import React from "react";
import * as Mui from "@material-ui/core";
import { DashboardLayout } from "component/layout/dashboard";
import { PageProps } from "shared/page-props";
import { GeographicRoute } from "./geographic-route"
import * as Router from "react-router-dom";
import * as Icons from "react-feather";
import { FeatherIcon } from "component/shared/feather-icon";

interface Props extends PageProps, Router.RouteComponentProps {
}

interface State {
	addAgentIsOpen: boolean
}

class Component extends React.Component<Props, State> {
	public constructor(props: Props) {
		super(props);
		this.state = {
			addAgentIsOpen: false
		};
	}


	public render() {
		const { user } = this.props;
		const title = user.type.client ? "Lead Routing" : `Welcome, ${user.name}`;
		return (
			<DashboardLayout
				permitted={user && user.permissions.leads}
				title={title}
				header={
					<Mui.Typography variant="h1">
						<FeatherIcon>
							<Icons.User />
						</FeatherIcon>
						{title}
					</Mui.Typography>
				}
			>
				<Mui.Grid container item xs={12} md={12}>

					<Mui.Grid
						container
						item
						spacing={4}
						direction="row"
						justifyContent="space-between"
					>
						<Mui.Grid item xs={12}>
							<Mui.Grid container direction="column" spacing={10} >
								<Mui.Grid item>
									<GeographicRoute/>	
								</Mui.Grid>
							</Mui.Grid>
						</Mui.Grid>
					</Mui.Grid>
				</Mui.Grid>
			</DashboardLayout>
		);
	}

}

export const LeadRoutingPage = Component;